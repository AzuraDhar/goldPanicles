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
            updated_at: new Date().toISOString()
        })
        .eq('request_id', id) // CHANGED: from 'id' to 'request_id'
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

export const deleteRequest = async (id) => {
    const { error } = await supabase
        .from('clientFormrequest')
        .delete()
        .eq('request_id', id); // CHANGED: from 'id' to 'request_id'
    
    if (error) throw error;
    return true;
};