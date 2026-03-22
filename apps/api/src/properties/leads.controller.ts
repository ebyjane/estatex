import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadEntity } from '../entities/lead.entity';

@Controller('leads')
export class LeadsController {
  constructor(@InjectRepository(LeadEntity) private readonly leads: Repository<LeadEntity>) {}

  @Post()
  create(
    @Body()
    body: {
      propertyId?: string;
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
    },
  ) {
    const row = this.leads.create({
      propertyId: body.propertyId || null,
      name: body.name || '',
      email: body.email || '',
      phone: body.phone || '',
      message: body.message || '',
      status: 'new',
    });
    return this.leads.save(row);
  }
}
