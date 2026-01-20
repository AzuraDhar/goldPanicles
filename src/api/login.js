import { supabase } from "./supabase"; 

export const logInUser = async (email, password) => {
  try {
    const { data, error } = await supabase
      .from("userAcc")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};
