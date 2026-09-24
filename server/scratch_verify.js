import http from 'http';

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Starting Comprehensive EduLead End-to-End Test Suite...\n');

  let passed = 0;
  let total = 0;

  function assert(description, condition, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${description}`);
    } else {
      console.error(`  ❌ [FAIL] ${description} ${details}`);
    }
  }

  // 1. Health check
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  assert('API Health Check', healthRes.status === 200 && healthRes.data.status === 'online');

  // 2. Demo Accounts
  const demoRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/demo-accounts',
    method: 'GET',
  });
  assert('Demo Accounts Retrieval', demoRes.status === 200 && demoRes.data.data.length >= 3);

  const adminAccount = demoRes.data.data.find((d) => d.role === 'ADMIN');
  const priyaAccount = demoRes.data.data.find((d) => d.email === 'priya@edulead.edu');
  const rohanAccount = demoRes.data.data.find((d) => d.email === 'rohan@edulead.edu');

  assert('Admin demo account present', !!adminAccount);
  assert('Counsellor Priya demo account present', !!priyaAccount);
  assert('Counsellor Rohan demo account present', !!rohanAccount);

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminAccount.token}`,
  };

  const priyaHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${priyaAccount.token}`,
  };

  // 3. Dashboard Metrics
  const dashRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/dashboard',
    method: 'GET',
    headers: adminHeaders,
  });
  assert('Dashboard Metrics API', dashRes.status === 200 && dashRes.data.success);
  const metrics = dashRes.data.data.metrics;
  assert('Dashboard Total Leads Metric', metrics.totalLeads > 0);
  assert('Dashboard Pipeline Stages', dashRes.data.data.pipeline.length === 6);
  assert('Dashboard Lead Sources', dashRes.data.data.sources.length === 7);
  assert('Dashboard Ageing Buckets', dashRes.data.data.ageing.length === 4);

  // 4. Analytics: The 4 Required Reports
  const reportRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/analytics',
    method: 'GET',
    headers: adminHeaders,
  });
  assert('Analytics API', reportRes.status === 200 && reportRes.data.success);
  assert('Report 1: Source Performance', reportRes.data.data.sourcePerformance.length > 0);
  assert('Report 2: Counsellor Performance', reportRes.data.data.counsellorPerformance.length > 0);
  assert('Report 3: Status Distribution Funnel', reportRes.data.data.statusDistribution.length > 0);
  assert('Report 4: Ageing Matrix Report', reportRes.data.data.ageingReport.length > 0);

  // 5. Counsellor Privacy Restriction
  const leadsPriyaRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/leads',
    method: 'GET',
    headers: priyaHeaders,
  });
  assert('Counsellor Leads Query', leadsPriyaRes.status === 200);
  const onlyAssignedToPriya = leadsPriyaRes.data.data.every(
    (l) => l.assignedCounsellor && l.assignedCounsellor.email === 'priya@edulead.edu'
  );
  assert('Privacy: Counsellor can only see assigned leads', onlyAssignedToPriya);

  // 6. Edge Case: Live Duplicate Detection
  const dupCheckRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/leads/check-duplicate',
      method: 'POST',
      headers: adminHeaders,
    },
    { phone: '+91 98450 12345' } // Rahul Kumar's phone
  );
  assert('Edge Case: Duplicate Phone Detection', dupCheckRes.status === 200 && dupCheckRes.data.hasDuplicates);

  // 7. Edge Case: Prevent Past Follow-up Date
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const firstLead = leadsPriyaRes.data.data[0];
  const pastFollowupRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/followups',
      method: 'POST',
      headers: priyaHeaders,
    },
    {
      leadId: firstLead._id,
      scheduledDate: yesterday,
      scheduledTime: '10:00 AM',
      type: 'Phone Call',
    }
  );
  assert('Edge Case: Block Past-date Follow-up', pastFollowupRes.status === 400);

  // 8. Edge Case: Premature Conversion validation
  const invalidConvertRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/leads/${firstLead._id}/status`,
      method: 'PATCH',
      headers: priyaHeaders,
    },
    {
      status: 'CONVERTED',
      // Missing mandatory admissionId and feePaid!
    }
  );
  assert('Edge Case: Block Conversion without Fee/ID', invalidConvertRes.status === 400);

  // 9. Edge Case: Mandatory Lost Reason
  const invalidLostRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/leads/${firstLead._id}/status`,
      method: 'PATCH',
      headers: priyaHeaders,
    },
    {
      status: 'LOST',
      // Missing lostReason!
    }
  );
  assert('Edge Case: Block Lost Status without Reason', invalidLostRes.status === 400);

  // 10. Mark Lost with reason then test Recovery
  const validLostRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/leads/${firstLead._id}/status`,
      method: 'PATCH',
      headers: priyaHeaders,
    },
    {
      status: 'LOST',
      lostReason: 'Budget / High Fee Structure',
      lostNotes: 'Student asked about installment options but opted out.',
    }
  );
  assert('Mark Lead Lost with Reason', validLostRes.status === 200);

  const recoverRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/leads/${firstLead._id}/recover`,
      method: 'POST',
      headers: priyaHeaders,
    },
    {
      recoveryReason: 'Student called back after scholarship discount approved.',
      targetStatus: 'FOLLOW_UP',
    }
  );
  assert('Edge Case: Accidental Lost Lead Recovery', recoverRes.status === 200 && recoverRes.data.data.status === 'FOLLOW_UP');

  // Verify Audit Activity was generated for recovery
  const auditRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/leads/${firstLead._id}`,
    method: 'GET',
    headers: priyaHeaders,
  });
  const hasRecoverActivity = auditRes.data.data.activities.some((a) => a.action === 'LEAD_RECOVERED');
  assert('Audit Activity Timeline generated for Recovery', hasRecoverActivity);

  console.log(`\n========================================================`);
  console.log(`🏁 Results: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================================\n`);
}

runTests().catch(console.error);
