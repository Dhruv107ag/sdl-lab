@echo off
title HCMS - Automated API Tests
echo =======================================================
echo  Running Automated Integration & Security Tests
echo =======================================================
cd backend
npm test
pause
