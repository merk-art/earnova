
// EARNOVA - SUPABASE CONNECTION

const SUPABASE_URL = "https://qvyidxjlgsifjoeukvri.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NSho27nW0wFlZSAsNC1I3w_zNwsJtJ9";

// Create the Supabase connection
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Earnova Supabase connection initialized!");
