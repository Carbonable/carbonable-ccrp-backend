import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly execAsync = promisify(exec);
  async resetDB(): Promise<{ message: string }> {
    try {
      const command = 'npx prisma migrate reset --force';

      this.logger.log(`Executing command: ${command}`);

      const { stdout, stderr } = await this.execAsync(command);

      if (stdout) this.logger.log(`Command Output: ${stdout}`);
      if (stderr) this.logger.error(`Command Error: ${stderr}`);
      return { message: 'Db resetted successfully' };
    } catch (error) {
      this.logger.error(`Failed to reset database: ${JSON.stringify(error)}`);
      throw new InternalServerErrorException('Failed to reset the database.');
    }
  }
}
