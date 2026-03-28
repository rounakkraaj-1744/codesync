import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PISTON_API = process.env.EXECUTION_API_URL || 'https://emkc.org/api/v2/piston';

const LANGUAGE_MAP: Record<string, { name: string; version: string }> = {
  javascript: { name: 'javascript', version: '18.15.0' },
  python: { name: 'python', version: '3.10.0' },
  cpp: { name: 'cpp', version: '10.2.0' },
  go: { name: 'go', version: '1.16.2' },
  java: { name: 'java', version: '15.0.2' },
  rust: { name: 'rust', version: '1.68.2' },
};

export async function POST(req: NextRequest) {
  try {
    const { language, code } = await req.json();

    const langConfig = LANGUAGE_MAP[language] || LANGUAGE_MAP.javascript;

    const response = await axios.post(`${PISTON_API}/execute`, {
      language: langConfig.name,
      version: langConfig.version,
      files: [{ content: code }],
    });

    const { run } = response.data;

    return NextResponse.json({
      stdout: run.stdout,
      stderr: run.stderr,
      output: run.output,
      code: run.code,
      signal: run.signal,
    });
  } catch (error: any) {
    console.error('Execution Error:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to execute code' }, { status: 500 });
  }
}
