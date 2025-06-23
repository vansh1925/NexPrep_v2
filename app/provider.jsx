"use client"
import { UserDetailContext } from '@/context/UserDetail.context';
import { supabase } from '@/services/supabaseClient'
import React, { useEffect } from 'react'

function Provider() {
    const [user, setUser] = React.useState(null);
    useEffect(() => {
        console.log('Provider component mounted');
        CreateNewUser();
    }, []);
    const CreateNewUser = () => {
        console.log('Creating new user if not exists');
        supabase.auth.getUser().then(async ({ data, error }) => {
            if (error) {
                console.error('Error fetching user:', error.message);
                return;
            }
            
            if (!data.user) {
                console.log('No authenticated user found');
                return;
            }
            
            console.log('Authenticated user:', data.user);
            
            //check if user already exists            
            let { data: Users, error: userError } = await supabase
                .from('Users')
                .select("*")
                .eq('email', data.user.email);
            
            if (userError) {
                console.error('Error fetching users:', userError.message);
                return;
            }
            
            console.log('Users found:', Users);
            
            // If User does not exist, create a new user
            if (!Users || Users.length === 0) {
                console.log('No user found, creating a new user');
                
                const { data: insertData, error: insertError } = await supabase
                    .from('Users')
                    .insert([
                        { 
                            Name: data.user.user_metadata?.name || data.user.email.split('@')[0], 
                            email: data.user.email, 
                            pfp: data.user.user_metadata?.picture || null, 
                        }
                    ])
                    
                
                if (insertError) {
                    console.error('Error creating new user:', insertError.message);
                    return;
                }
                
                console.log('New user created successfully:', insertData);
                setUser(insertData[0]);
            } else {
                console.log('User already exists, not creating a new one');
            }
        }).catch(err => {
            console.error('Unexpected error in CreateNewUser:', err);
        });
    }
    
    return (
        <UserDetailContext.Provider value={{ user, setUser }}>
            <div>provider</div>
        </UserDetailContext.Provider>
    )
}

export default Provider
export const userUser= () => {
    const context = React.useContext(UserDetailContext);

    return context;
}