//Simple in-memory session store.
//
// This is intentionally NOT persistent storage. Sessions only live in
// server memory and disappear on restart. This is a deliberate choice;
// it avoids writing organizational data to the disk. 
// If you want persistence, see /docs/SECURITY.md before adding a database. 