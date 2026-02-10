import { supabase } from './supabase'

export const signUpUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('userAcc') // Replace 'users' with your table name
      .insert([
        {
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password, 
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      console.error('Error inserting data:', error)
      return { success: false, error }
    }

    console.log('User created successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Exception:', error)
    return { success: false, error }
  }
}