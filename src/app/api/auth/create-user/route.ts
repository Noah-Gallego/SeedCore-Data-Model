import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../utils/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { 
      authId, 
      email, 
      firstName, 
      lastName, 
      role,
      // Teacher-specific fields
      schoolName,
      schoolAddress,
      schoolCity,
      schoolState,
      schoolPostalCode,
      positionTitle
    } = await request.json();

    if (!authId || !email || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize role to lowercase to ensure consistent handling
    const normalizedRole = role.toLowerCase();
    
    // Additional validation for teacher accounts
    if (normalizedRole === 'teacher') {
      if (!schoolName || !schoolAddress || !schoolCity || !schoolState || !schoolPostalCode || !positionTitle) {
        return NextResponse.json({ error: 'Missing required teacher fields' }, { status: 400 });
      }
    }

    console.log(`Creating user with role: ${normalizedRole}`);

    // First check if a user with this auth_id already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('auth_id', authId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means "no rows returned" which is expected if the user doesn't exist
      console.error('Error checking for existing user:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }
    
    let data, error;

    // If user already exists, use that user
    if (existingUser) {
      console.log(`User with auth_id ${authId} already exists with role ${existingUser.role}`);
      
      // If the existing user is a teacher but has no teacher profile yet
      if (normalizedRole === 'teacher') {
        // Check if there's a teacher profile
        const { data: teacherProfile, error: profileError } = await supabaseAdmin
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', existingUser.id)
          .single();
        
        if (profileError && profileError.code === 'PGRST116') {
          // No teacher profile exists, create one
          const { data: newTeacherProfile, error: createProfileError } = await supabaseAdmin
            .from('teacher_profiles')
            .insert({
              user_id: existingUser.id,
              school_name: schoolName,
              school_address: schoolAddress,
              school_city: schoolCity,
              school_state: schoolState,
              school_postal_code: schoolPostalCode,
              position_title: positionTitle,
              account_status: 'pending',
              employment_verified: false,
              nonprofit_status_verified: false
            })
            .select()
            .single();
          
          if (createProfileError) {
            console.error('Error creating teacher profile:', createProfileError);
            return NextResponse.json({ error: createProfileError.message }, { status: 500 });
          }
        }
      }
      
      data = existingUser;
    } else {
      // User doesn't exist, create a new one
      try {
        // First try the new function
        const result = await supabaseAdmin.rpc('create_user_with_profile', {
          p_auth_id: authId,
          p_email: email,
          p_first_name: firstName,
          p_last_name: lastName,
          p_role: normalizedRole,
          p_school_name: schoolName || null,
          p_school_address: schoolAddress || null,
          p_school_city: schoolCity || null,
          p_school_state: schoolState || null,
          p_school_postal_code: schoolPostalCode || null,
          p_position_title: positionTitle || null
        });
        
        data = result.data;
        error = result.error;
        
        // If error, it likely means the function doesn't exist yet
        if (error) {
          console.log("Function create_user_with_profile not found, trying direct insert");
          
          // Direct insert approach
          const { data: userData, error: userError } = await supabaseAdmin
            .from('users')
            .insert({
              auth_id: authId,
              email,
              first_name: firstName,
              last_name: lastName,
              role: normalizedRole
            })
            .select()
            .single();
          
          if (userError) {
            console.error('Error inserting user:', userError);
            return NextResponse.json({ error: userError.message }, { status: 500 });
          }
          
          data = userData;
          
          // Create the appropriate profile
          if (normalizedRole === 'teacher') {
            const { error: teacherError } = await supabaseAdmin
              .from('teacher_profiles')
              .insert({
                user_id: userData.id,
                school_name: schoolName,
                school_address: schoolAddress,
                school_city: schoolCity,
                school_state: schoolState,
                school_postal_code: schoolPostalCode,
                position_title: positionTitle,
                account_status: 'pending',
                employment_verified: false,
                nonprofit_status_verified: false
              });
            
            if (teacherError) {
              console.error('Error creating teacher profile:', teacherError);
              return NextResponse.json({ error: teacherError.message }, { status: 500 });
            }
          } else if (normalizedRole === 'donor') {
            const { error: donorError } = await supabaseAdmin
              .from('donor_profiles')
              .insert({
                user_id: userData.id,
                donation_total: 0,
                projects_supported: 0
              });
            
            if (donorError) {
              console.error('Error creating donor profile:', donorError);
              return NextResponse.json({ error: donorError.message }, { status: 500 });
            }
          }
        }
      } catch (functionError) {
        console.error('Error calling functions:', functionError);
        error = { message: 'Error calling database functions' };
      }
    }

    if (error) {
      console.error('Error creating user and profile:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('User profile ready:', data);

    return NextResponse.json({ 
      success: true, 
      user: data,
      message: normalizedRole === 'teacher' 
        ? 'Account created successfully. Your teacher account will need to be verified before you can create projects.'
        : 'Account created successfully.'
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 