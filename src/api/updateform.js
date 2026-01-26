import { supabase } from "./supabase";

export const updateRequest = async (id, updatedData) => {
    const { data, error } = await supabase
        .from('clientFormrequest')
        .update({
            eventTitle: updatedData.eventTitle,
            description: updatedData.description,
            date: updatedData.date,
            time: updatedData.time,
            location: updatedData.location,
            contactInfo: updatedData.contactInfo,
            contactPerson: updatedData.contactPerson,
            attachFile: updatedData.attachFile,
            // Status is NOT included here - only admin can update it
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

export const deleteRequest = async (id) => {
    const { error } = await supabase
        .from('clientFormrequest')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
    return true;
};