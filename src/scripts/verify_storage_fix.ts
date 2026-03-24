
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
        acc[key.trim()] = value.trim();
    }
    return acc;
}, {} as Record<string, string>);

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseAnonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpload() {
    console.log('1. Signing in...');
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'usaidowais123@gmail.com',
        password: 'admin123'
    });

    if (authError || !user) {
        console.error('Login failed:', authError?.message);
        return;
    }
    console.log('User signed in:', user.id);

    console.log('2. Preparing dummy file...');
    // Create a dummy file object if we were in browser, but here we are in node.
    // The service expects a 'File' object which is browser native.
    // In Node we can't easily pass 'File' to the service unmodified if the service is browser-only.
    // Let's modify the service call logic slightly for the test or just invoke the raw storage call to prove the PATH rule.

    // Actually, checking the service code:
    // It accepts "file: File".
    // In Node, we can verify the PATH construction by calling the logic directly here.

    const bucket = 'media';
    const fileName = `test_script_${Date.now()}.txt`;
    const filePath = `${user.id}/${fileName}`;

    console.log(`2.1 Creating bucket '${bucket}'...`);
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 1048576, // 1MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'model/gltf-binary', 'model/vnd.usdz+zip', 'text/plain']
    });

    if (bucketError) {
        console.warn('Bucket creation failed (likely exists or permission denied):', bucketError.message);
    } else {
        console.log('Bucket created successfully!');
    }

    console.log(`3. Attempting upload to '${bucket}/${filePath}'...`);

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, 'dummy content', {
            contentType: 'text/plain',
            upsert: true
        });

    if (error) {
        console.error('FAILED: Upload rejected:', error.message);
        console.error('Check if RLS allows this path.');
    } else {
        console.log('SUCCESS: Upload accepted!');
        console.log('Path:', data?.path);
    }
}

testUpload();
