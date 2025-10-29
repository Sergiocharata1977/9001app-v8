import { NextRequest, NextResponse } from 'next/server';
import { PersonnelService } from '@/services/rrhh/PersonnelService';
import { personnelSchema, personnelFiltersSchema, paginationSchema } from '@/lib/validations/rrhh';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = personnelFiltersSchema.parse({
      search: searchParams.get('search') || undefined,
      estado: (searchParams.get('estado') as 'Activo' | 'Inactivo' | 'Licencia') || undefined,
      tipo_personal: (searchParams.get('tipo_personal') as any) || undefined,
      supervisor_id: searchParams.get('supervisor_id') || undefined,
    });

    // Parse pagination
    const pagination = paginationSchema.parse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sort: searchParams.get('sort') || undefined,
      order: searchParams.get('order') || 'desc',
    });

    const result = await PersonnelService.getPaginated(filters, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in personnel GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener personal' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = personnelSchema.parse(body);

    const personnel = await PersonnelService.create(validatedData);

    return NextResponse.json(personnel, { status: 201 });
  } catch (error) {
    console.error('Error in personnel POST:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: (error as any).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear personal' },
      { status: 500 }
    );
  }
}