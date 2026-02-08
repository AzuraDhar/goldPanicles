import { supabase } from "./supabase";

/**
 * Get all requests
 */
export const getRequests = async () => {
  try {
    console.log('📋 getRequests: Fetching all requests...');
    
    const { data, error } = await supabase
      .from('clientFormrequest')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error in getRequests:', error);
      throw error;
    }
    
    console.log(`✅ getRequests: Found ${data?.length || 0} requests`);
    
    // Log first request for debugging
    if (data && data.length > 0) {
      console.log('🔍 First request sample:', {
        request_id: data[0].request_id,
        eventTitle: data[0].eventTitle,
        user_id: data[0].user_id,
        status: data[0].status,
        created_at: data[0].created_at
      });
    }
    
    return data || [];
    
  } catch (error) {
    console.error('❌ Error in getRequests:', error);
    throw new Error(`Failed to fetch requests: ${error.message}`);
  }
};

/**
 * Get requests for a specific user
 */
export const getRequestsByUserId = async (userId) => {
  try {
    console.log(`👤 getRequestsByUserId: Fetching requests for user ${userId}`);
    
    const { data, error } = await supabase
      .from('clientFormrequest')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error in getRequestsByUserId:', error);
      throw error;
    }
    
    console.log(`✅ Found ${data?.length || 0} requests for user ${userId}`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Error in getRequestsByUserId:', error);
    throw new Error(`Failed to fetch user requests: ${error.message}`);
  }
};