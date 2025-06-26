-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- Multi-tenant data isolation for SaaS platform
-- =====================================================

-- Helper function to get current user's organization_id from JWT
CREATE OR REPLACE FUNCTION auth.current_user_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'organization_id',
    (SELECT organization_id FROM users WHERE id = auth.uid())
  )::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    auth.jwt() ->> 'role',
    (SELECT role FROM users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ORGANIZATIONS TABLE POLICIES
-- =====================================================

-- Users can only see their own organization
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (
    id = auth.current_user_organization_id()
  );

-- Only admins can update organization details
CREATE POLICY "Admins can update organization" ON organizations
  FOR UPDATE USING (
    id = auth.current_user_organization_id() 
    AND auth.current_user_role() = 'admin'
  );

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view other users in their organization
CREATE POLICY "Users can view organization members" ON users
  FOR SELECT USING (
    organization_id = auth.current_user_organization_id()
  );

-- Only admins can insert new users
CREATE POLICY "Admins can create users" ON users
  FOR INSERT WITH CHECK (
    organization_id = auth.current_user_organization_id()
    AND auth.current_user_role() = 'admin'
  );

-- Users can update their own profile, admins can update anyone
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (
    (id = auth.uid()) OR 
    (organization_id = auth.current_user_organization_id() AND auth.current_user_role() = 'admin')
  );

-- Only admins can delete users
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (
    organization_id = auth.current_user_organization_id()
    AND auth.current_user_role() = 'admin'
  );

-- =====================================================
-- JOBS TABLE POLICIES
-- =====================================================

-- All organization members can view jobs
CREATE POLICY "Organization members can view jobs" ON jobs
  FOR SELECT USING (
    organization_id = auth.current_user_organization_id()
  );

-- Admins and recruiters can create jobs
CREATE POLICY "Admins and recruiters can create jobs" ON jobs
  FOR INSERT WITH CHECK (
    organization_id = auth.current_user_organization_id()
    AND auth.current_user_role() IN ('admin', 'recruiter')
  );

-- Admins and job creators can update jobs
CREATE POLICY "Admins and creators can update jobs" ON jobs
  FOR UPDATE USING (
    organization_id = auth.current_user_organization_id()
    AND (auth.current_user_role() = 'admin' OR created_by = auth.uid())
  );

-- Admins and job creators can delete jobs
CREATE POLICY "Admins and creators can delete jobs" ON jobs
  FOR DELETE USING (
    organization_id = auth.current_user_organization_id()
    AND (auth.current_user_role() = 'admin' OR created_by = auth.uid())
  );

-- =====================================================
-- CANDIDATES TABLE POLICIES
-- =====================================================

-- All organization members can view candidates
CREATE POLICY "Organization members can view candidates" ON candidates
  FOR SELECT USING (
    organization_id = auth.current_user_organization_id()
  );

-- Admins and recruiters can create candidates
CREATE POLICY "Admins and recruiters can create candidates" ON candidates
  FOR INSERT WITH CHECK (
    organization_id = auth.current_user_organization_id()
    AND auth.current_user_role() IN ('admin', 'recruiter')
  );

-- Admins and recruiters can update candidates
CREATE POLICY "Admins and recruiters can update candidates" ON candidates
  FOR UPDATE USING (
    organization_id = auth.current_user_organization_id()
    AND auth.current_user_role() IN ('admin', 'recruiter')
  );

-- Only admins can delete candidates
CREATE POLICY "Admins can delete candidates" ON candidates
  FOR DELETE USING (
    organization_id = auth.current_user_organization_id()
    AND auth.current_user_role() = 'admin'
  );

-- =====================================================
-- CV_ANALYSES TABLE POLICIES
-- =====================================================

-- All organization members can view CV analyses
CREATE POLICY "Organization members can view analyses" ON cv_analyses
  FOR SELECT USING (
    organization_id = auth.current_user_organization_id()
  );

-- System can create analyses (usually via API)
CREATE POLICY "System can create analyses" ON cv_analyses
  FOR INSERT WITH CHECK (
    organization_id = auth.current_user_organization_id()
  );

-- Admins and recruiters can update analyses
CREATE POLICY "Admins and recruiters can update analyses" ON cv_analyses
  FOR UPDATE USING (
    organization_id = auth.current_user_organization_id()
    AND auth.current_user_role() IN ('admin', 'recruiter')
  );

-- Only admins can delete analyses
CREATE POLICY "Admins can delete analyses" ON cv_analyses
  FOR DELETE USING (
    organization_id = auth.current_user_organization_id()
    AND auth.current_user_role() = 'admin'
  );

-- =====================================================
-- AUDIT_LOGS TABLE POLICIES
-- =====================================================

-- All organization members can view audit logs
CREATE POLICY "Organization members can view audit logs" ON audit_logs
  FOR SELECT USING (
    organization_id = auth.current_user_organization_id()
  );

-- System can create audit logs
CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (
    organization_id = auth.current_user_organization_id()
  );

-- No updates or deletes allowed on audit logs (immutable)
-- This ensures audit trail integrity