-- 创建标签表
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建图片标签关联表
CREATE TABLE IF NOT EXISTS image_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id, tag_id)
);

-- 创建用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- 创建系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建API使用统计表
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    ai_model VARCHAR(50),
    tokens_used INTEGER,
    cost_cents INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建图片分享表
CREATE TABLE IF NOT EXISTS image_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID REFERENCES images(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0,
    max_views INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加更多索引
CREATE INDEX IF NOT EXISTS idx_image_tags_image_id ON image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_image_tags_tag_id ON image_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_image_id ON user_favorites(image_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_image_shares_token ON image_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_image_shares_image_id ON image_shares(image_id);

-- 启用RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_shares ENABLE ROW LEVEL SECURITY;

-- 标签表RLS策略（所有人可读，管理员可写）
CREATE POLICY "Anyone can view tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage tags" ON tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- 图片标签关联表RLS策略
CREATE POLICY "Users can view image tags" ON image_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM images 
            WHERE images.id = image_tags.image_id 
            AND (images.user_id = auth.uid() OR images.is_public = true)
        )
    );

CREATE POLICY "Users can manage own image tags" ON image_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM images 
            WHERE images.id = image_tags.image_id 
            AND images.user_id = auth.uid()
        )
    );

-- 用户收藏表RLS策略
CREATE POLICY "Users can view own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- 系统日志表RLS策略（管理员可见）
CREATE POLICY "Admins can view system logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- API使用统计RLS策略
CREATE POLICY "Users can view own api usage" ON api_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert api usage" ON api_usage
    FOR INSERT WITH CHECK (true);

-- 用户会话表RLS策略
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 图片分享表RLS策略
CREATE POLICY "Users can view own image shares" ON image_shares
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM images 
            WHERE images.id = image_shares.image_id 
            AND images.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own image shares" ON image_shares
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM images 
            WHERE images.id = image_shares.image_id 
            AND images.user_id = auth.uid()
        )
    );

-- 插入一些默认标签
INSERT INTO tags (name, description, color) VALUES
    ('吉卜力风格', '经典吉卜力工作室艺术风格', '#4CAF50'),
    ('风景', '自然风景和环境', '#2196F3'),
    ('人物', '角色和人物肖像', '#FF9800'),
    ('动物', '可爱的动物角色', '#E91E63'),
    ('建筑', '建筑物和结构', '#9C27B0'),
    ('魔法', '魔法和奇幻元素', '#673AB7'),
    ('森林', '森林和树木场景', '#4CAF50'),
    ('天空', '天空和云朵', '#03A9F4'),
    ('复古', '复古和怀旧风格', '#795548'),
    ('梦幻', '梦幻和超现实', '#E91E63')
ON CONFLICT (name) DO NOTHING;