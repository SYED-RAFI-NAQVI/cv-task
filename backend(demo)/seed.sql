-- =====================================================
-- SEED DATA FOR CV SCREENING SAAS PLATFORM
-- Sample data for testing and demonstration
-- =====================================================

-- Insert sample organizations
INSERT INTO organizations (id, name, slug, email, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'TechCorp Solutions', 'techcorp', 'admin@techcorp.com', 'active'),
('550e8400-e29b-41d4-a716-446655440001', 'StartupXYZ', 'startupxyz', 'hello@startupxyz.com', 'trial'),
('550e8400-e29b-41d4-a716-446655440002', 'Enterprise Inc', 'enterprise', 'contact@enterprise.com', 'active');

-- Insert sample users
INSERT INTO users (id, organization_id, email, name, role, password_hash, is_active) VALUES
-- TechCorp users
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'john@techcorp.com', 'John Smith', 'admin', '$2b$10$hashedpassword1', true),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'sarah@techcorp.com', 'Sarah Johnson', 'recruiter', '$2b$10$hashedpassword2', true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'mike@techcorp.com', 'Mike Wilson', 'viewer', '$2b$10$hashedpassword3', true),

-- StartupXYZ users
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'emma@startupxyz.com', 'Emma Davis', 'admin', '$2b$10$hashedpassword4', true),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'alex@startupxyz.com', 'Alex Chen', 'recruiter', '$2b$10$hashedpassword5', true),

-- Enterprise Inc users
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'robert@enterprise.com', 'Robert Brown', 'admin', '$2b$10$hashedpassword6', true);

-- Insert sample jobs
INSERT INTO jobs (id, organization_id, created_by, title, description, requirements, location, job_type, status) VALUES
-- TechCorp jobs
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Senior Frontend Developer', 'We are looking for an experienced frontend developer to join our team. You will be responsible for building modern web applications using React, TypeScript, and Next.js.', 'React, TypeScript, Next.js, 5+ years experience, Strong CSS skills', 'San Francisco, CA', 'full-time', 'active'),

('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Backend Engineer', 'Join our backend team to build scalable APIs and microservices. Experience with Node.js, Python, and cloud platforms required.', 'Node.js, Python, AWS/GCP, Docker, Kubernetes, 3+ years experience', 'Remote', 'full-time', 'active'),

-- StartupXYZ jobs
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'Full Stack Developer', 'Looking for a versatile full-stack developer to help build our MVP. Perfect for someone who loves wearing multiple hats!', 'JavaScript, React, Node.js, MongoDB, 2+ years experience', 'New York, NY', 'full-time', 'active'),

-- Enterprise Inc jobs
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'DevOps Engineer', 'We need a DevOps engineer to help modernize our infrastructure and implement CI/CD pipelines.', 'Docker, Kubernetes, Jenkins, Terraform, AWS, 4+ years experience', 'Chicago, IL', 'full-time', 'active');

-- Insert sample candidates
INSERT INTO candidates (id, job_id, organization_id, name, email, phone, location, experience_years, current_title, cv_file_url, cv_file_name, cv_file_size, status) VALUES
-- Candidates for TechCorp Frontend role
('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Alice Cooper', 'alice.cooper@email.com', '+1-555-0101', 'San Francisco, CA', 6, 'Senior React Developer', 'https://storage.bucket/alice-cooper-cv.pdf', 'alice-cooper-cv.pdf', 2048576, 'new'),

('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Bob Martinez', 'bob.martinez@email.com', '+1-555-0102', 'Oakland, CA', 4, 'Frontend Engineer', 'https://storage.bucket/bob-martinez-cv.pdf', 'bob-martinez-cv.pdf', 1536789, 'reviewed'),

('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Carol Zhang', 'carol.zhang@email.com', '+1-555-0103', 'San Jose, CA', 8, 'Lead Frontend Developer', 'https://storage.bucket/carol-zhang-cv.pdf', 'carol-zhang-cv.pdf', 2234567, 'shortlisted'),

-- Candidates for TechCorp Backend role
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'David Kim', 'david.kim@email.com', '+1-555-0104', 'Remote', 5, 'Backend Engineer', 'https://storage.bucket/david-kim-cv.pdf', 'david-kim-cv.pdf', 1987654, 'new'),

-- Candidates for StartupXYZ Full Stack role
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Emily Rodriguez', 'emily.rodriguez@email.com', '+1-555-0105', 'New York, NY', 3, 'Full Stack Developer', 'https://storage.bucket/emily-rodriguez-cv.pdf', 'emily-rodriguez-cv.pdf', 1765432, 'new'),

-- Candidates for Enterprise DevOps role
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Frank Thompson', 'frank.thompson@email.com', '+1-555-0106', 'Chicago, IL', 7, 'Senior DevOps Engineer', 'https://storage.bucket/frank-thompson-cv.pdf', 'frank-thompson-cv.pdf', 2456789, 'reviewed');

-- Insert sample CV analyses
INSERT INTO cv_analyses (id, candidate_id, organization_id, match_score, summary, key_strengths, potential_concerns, technical_skills, experience_level, recommendation, similarity_score, processing_time_ms, ai_model_version) VALUES

-- Analysis for Alice Cooper (Frontend role)
('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 92, 'Excellent candidate with strong React expertise and proven track record in frontend development. Perfect fit for senior role.', 
'["Advanced React/TypeScript skills", "Leadership experience", "Strong portfolio", "Modern development practices"]', 
'["Salary expectations may be high"]', 
'["React", "TypeScript", "Next.js", "CSS", "JavaScript", "Git"]', 
'senior', 'interview', 89, 2340, 'gemini-2.0-flash'),

-- Analysis for Bob Martinez (Frontend role)
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 78, 'Solid frontend developer with good React skills. Some experience gaps but shows potential for growth.', 
'["React proficiency", "Eager to learn", "Good communication skills"]', 
'["Limited TypeScript experience", "Lacks senior-level projects"]', 
'["React", "JavaScript", "HTML", "CSS", "Git"]', 
'mid', 'consider', 76, 1890, 'gemini-2.0-flash'),

-- Analysis for Carol Zhang (Frontend role)  
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 95, 'Outstanding candidate with extensive frontend leadership experience. Exactly what we need for this senior position.', 
'["Exceptional React/TypeScript expertise", "Team leadership", "Architecture design", "Performance optimization"]', 
'[]', 
'["React", "TypeScript", "Next.js", "GraphQL", "CSS-in-JS", "Testing", "Webpack"]', 
'senior', 'interview', 93, 2156, 'gemini-2.0-flash'),

-- Analysis for David Kim (Backend role)
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 85, 'Strong backend engineer with solid Node.js and cloud experience. Good fit for our backend team.', 
'["Node.js expertise", "AWS experience", "Microservices architecture", "API design"]', 
'["Limited Python experience"]', 
'["Node.js", "JavaScript", "AWS", "Docker", "MongoDB", "REST APIs"]', 
'senior', 'interview', 82, 2001, 'gemini-2.0-flash'),

-- Analysis for Emily Rodriguez (Full Stack role)
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 81, 'Promising full-stack developer with good foundational skills. Perfect for a growing startup environment.', 
'["Full-stack capabilities", "Startup experience", "Quick learner", "Adaptable"]', 
'["Relatively junior", "Limited large-scale project experience"]', 
'["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS"]', 
'mid', 'consider', 79, 1723, 'gemini-2.0-flash'),

-- Analysis for Frank Thompson (DevOps role)
('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 88, 'Experienced DevOps engineer with strong containerization and CI/CD skills. Great addition to infrastructure team.', 
'["Docker/Kubernetes expertise", "CI/CD pipeline experience", "AWS proficiency", "Infrastructure as Code"]', 
'["Limited Terraform experience"]', 
'["Docker", "Kubernetes", "Jenkins", "AWS", "Linux", "Python", "Bash"]', 
'senior', 'interview', 85, 2278, 'gemini-2.0-flash');

-- Insert sample audit logs
INSERT INTO audit_logs (organization_id, user_id, action, resource_type, resource_id, details, ip_address) VALUES
('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'create_job', 'job', '770e8400-e29b-41d4-a716-446655440000', '{"job_title": "Senior Frontend Developer"}', '192.168.1.100'),
('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'upload_cv', 'candidate', '880e8400-e29b-41d4-a716-446655440000', '{"candidate_name": "Alice Cooper", "file_size": 2048576}', '192.168.1.100'),
('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440002', 'view_candidate', 'candidate', '880e8400-e29b-41d4-a716-446655440002', '{"candidate_name": "Carol Zhang"}', '192.168.1.101'),
('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440004', 'create_job', 'job', '770e8400-e29b-41d4-a716-446655440002', '{"job_title": "Full Stack Developer"}', '10.0.1.50');