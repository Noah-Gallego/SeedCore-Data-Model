import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../utils/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const {
      teacherId,
      title,
      description,
      studentImpact,
      fundingGoal,
      endDate,
      mainImageUrl,
      categories
    } = await request.json();

    // Validate required fields
    if (!teacherId || !title || !description || !studentImpact || !fundingGoal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .insert([
        {
          teacher_id: teacherId,
          title,
          description,
          student_impact: studentImpact,
          funding_goal: fundingGoal,
          end_date: endDate || null,
          main_image_url: mainImageUrl || null,
          status: 'draft', // All projects start as drafts
          current_amount: 0,
          donor_count: 0,
        },
      ])
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    // If categories are provided, add them to project_categories
    if (categories && categories.length > 0) {
      const categoryInserts = categories.map((categoryId: string) => ({
        project_id: project.id,
        category_id: categoryId,
      }));

      const { error: categoriesError } = await supabaseAdmin
        .from('project_categories')
        .insert(categoryInserts);

      if (categoriesError) {
        console.error('Error adding project categories:', categoriesError);
        // We don't return an error here, as the project was already created
        // But we log it for debugging
      }
    }

    return NextResponse.json({ 
      success: true, 
      project: project,
      message: 'Project created successfully. It will need to be reviewed before becoming active.' 
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 