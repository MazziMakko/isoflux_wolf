// =====================================================
// PROJECTS API - CRUD OPERATIONS
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/core/security';
import DataGateway from '@/lib/core/data-gateway';
import { nanoid } from 'nanoid';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  config: z.record(z.any()).optional(),
  aiSettings: z.record(z.any()).optional(),
});

// GET /api/projects - List projects
async function handleGet(req: NextRequest, context: any) {
  if (!context.organizationId) {
    return NextResponse.json(
      { error: 'No organization', code: 'NO_ORGANIZATION' },
      { status: 403 }
    );
  }

  const dataGateway = new DataGateway();

  try {
    const projects = await dataGateway.getOrganizationProjects(
      context.organizationId
    );

    return NextResponse.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        status: p.status,
        deploymentUrl: p.deployment_url,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    });
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create project
async function handlePost(req: NextRequest, context: any) {
  const dataGateway = new DataGateway(true);

  try {
    const body = await req.json();
    const validated = createProjectSchema.parse(body);

    const slug = `${validated.name.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`;

    const project = await dataGateway.createProject({
      organization_id: context.organizationId,
      name: validated.name,
      slug,
      description: validated.description || null,
      status: 'draft',
      config: validated.config || {},
      ai_settings: validated.aiSettings || {},
      created_by: context.userId,
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        status: project.status,
        createdAt: project.created_at,
      },
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGet);
export const POST = withAuth(handlePost, { requiredRole: 'editor' });
