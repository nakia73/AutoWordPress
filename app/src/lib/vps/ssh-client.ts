// Argo Note - SSH Client for VPS Connection
// Used to execute commands on the WordPress VPS

import { Client, ConnectConfig } from 'ssh2';

// Environment variables
const VPS_HOST = process.env.VPS_HOST;
const VPS_SSH_USER = process.env.VPS_SSH_USER || 'root';
const VPS_SSH_PRIVATE_KEY = process.env.VPS_SSH_PRIVATE_KEY;
const VPS_SSH_PORT = parseInt(process.env.VPS_SSH_PORT || '22', 10);

export interface SSHExecuteResult {
  stdout: string;
  stderr: string;
  code: number;
}

export interface SSHClientOptions {
  host?: string;
  port?: number;
  username?: string;
  privateKey?: string;
  timeout?: number;
}

export class SSHClient {
  private client: Client;
  private config: ConnectConfig;
  private isConnected: boolean = false;

  constructor(options?: SSHClientOptions) {
    this.client = new Client();

    // Decode base64 private key if provided
    let privateKey: string | undefined;
    const keySource = options?.privateKey || VPS_SSH_PRIVATE_KEY;
    if (keySource) {
      try {
        // Try to decode as base64
        privateKey = Buffer.from(keySource, 'base64').toString('utf-8');
        // If it doesn't look like a PEM key, use original
        if (!privateKey.includes('-----BEGIN')) {
          privateKey = keySource;
        }
      } catch {
        privateKey = keySource;
      }
    }

    this.config = {
      host: options?.host || VPS_HOST,
      port: options?.port || VPS_SSH_PORT,
      username: options?.username || VPS_SSH_USER,
      privateKey,
      readyTimeout: options?.timeout || 30000,
    };
  }

  /**
   * Validate that required configuration is present
   */
  private validateConfig(): void {
    if (!this.config.host) {
      throw new Error('VPS_HOST is not configured');
    }
    if (!this.config.privateKey) {
      throw new Error('VPS_SSH_PRIVATE_KEY is not configured');
    }
  }

  /**
   * Connect to the VPS via SSH
   */
  async connect(): Promise<void> {
    this.validateConfig();

    if (this.isConnected) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        this.isConnected = true;
        resolve();
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        reject(new Error(`SSH connection failed: ${err.message}`));
      });

      this.client.connect(this.config);
    });
  }

  /**
   * Execute a command on the VPS
   */
  async execute(command: string): Promise<SSHExecuteResult> {
    if (!this.isConnected) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) {
          reject(new Error(`SSH exec failed: ${err.message}`));
          return;
        }

        let stdout = '';
        let stderr = '';

        stream.on('close', (code: number) => {
          resolve({ stdout, stderr, code });
        });

        stream.on('data', (data: Buffer) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString();
        });
      });
    });
  }

  /**
   * Execute multiple commands sequentially
   */
  async executeMultiple(commands: string[]): Promise<SSHExecuteResult[]> {
    const results: SSHExecuteResult[] = [];

    for (const command of commands) {
      const result = await this.execute(command);
      results.push(result);

      // Stop if a command fails
      if (result.code !== 0) {
        break;
      }
    }

    return results;
  }

  /**
   * Disconnect from the VPS
   */
  disconnect(): void {
    if (this.isConnected) {
      this.client.end();
      this.isConnected = false;
    }
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }
}

/**
 * Execute a single command on the VPS (convenience function)
 */
export async function executeSSHCommand(command: string): Promise<SSHExecuteResult> {
  const client = new SSHClient();
  try {
    await client.connect();
    const result = await client.execute(command);
    return result;
  } finally {
    client.disconnect();
  }
}

/**
 * Check VPS connection
 */
export async function checkVPSConnection(): Promise<boolean> {
  const client = new SSHClient();
  try {
    await client.connect();
    const result = await client.execute('echo "connection test"');
    return result.code === 0;
  } catch {
    return false;
  } finally {
    client.disconnect();
  }
}
