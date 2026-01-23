import { supabase } from "./supabase";


export const getRequests = async () => {
    const { data, error } = await supabase
        .from('clientFormrequest')
        .select('*');
    
    if (error) throw error;
    return data;
};