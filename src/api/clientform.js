import { supabase } from "./supabase";

export const submitClientForm = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('clientFormrequest')
      .insert([formData]);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting form:', error);
    return { success: false, error: error.message };
  }
};