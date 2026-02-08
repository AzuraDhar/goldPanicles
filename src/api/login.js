// api/login.js
import { supabase } from "./supabase"; 

export const logInUser = async (email, password) => {
  try {
    console.log("Attempting login for:", email);
    
    // First, try staffDB table (for Administrators, Section Heads, Staff)
    console.log("Checking staffDB table...");
    const { data: staffData, error: staffError } = await supabase
      .from("staffDB")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    // If found in staffDB
    if (staffData && !staffError) {
      console.log("✅ Found in staffDB:", staffData);
      return { 
        success: true, 
        data: staffData 
      };
    }

    console.log("Not in staffDB, checking userAcc table...");
    
    // Try userAcc table (for clients)
    const { data: userAccData, error: userAccError } = await supabase
      .from("userAcc")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    // If found in userAcc
    if (userAccData && !userAccError) {
      console.log("✅ Found in userAcc:", userAccData);
      return { 
        success: true, 
        data: {
          ...userAccData,
          role: "client" // Ensure role is set for clients
        }
      };
    }

    // Check what errors we got
    if (staffError && staffError.code === 'PGRST116') {
      console.log("No user found in staffDB");
    }
    if (userAccError) {
      console.log("userAcc error:", userAccError.message);
    }

    // If not found in either table
    console.log("❌ Not found in any table");
    return { 
      success: false, 
      message: "Invalid email or password" 
    };

  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: "An error occurred during login" 
    };
  }
};