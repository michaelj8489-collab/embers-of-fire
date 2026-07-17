'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const DEFAULT_USER_TIER = 'seeker';

type HeaderProfile = {
  subscription_tier: string | null;
  role: string | null;
  username: string | null;
};

type HeaderChatMessage = {
  [key: string]: unknown;
  content?: string | null;
  recipient_id?: string | null;
  user_id?: string | null;
};

type HeaderChatPayload = {
  new: HeaderChatMessage;
};

type RealtimeSubscribeStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR';
type RealtimeRemovalStatus = 'ok' | 'timed out' | 'error';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false); // Main Mobile Menu
  const [hearthOpen, setHearthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTier, setUserTier] = useState(DEFAULT_USER_TIER);
  const [isAdmin, setIsAdmin] = useState(false); // <-- NEW ADMIN STATE
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const [myUsername, setMyUsername] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const router = useRouter();
  const supabase = createClient();
  const activeProfileUserIdRef = useRef<string | null>(null);
  const profileRequestIdRef = useRef(0);
  const isHeaderActiveRef = useRef(false);
  const hearthButtonRef = useRef<HTMLButtonElement>(null);

  const resetUserState = useCallback(() => {
    activeProfileUserIdRef.current = null;
    profileRequestIdRef.current += 1;
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserTier(DEFAULT_USER_TIER);
    setMyUsername('');
    setUserId('');
    setHasUnreadChat(false);
    setIsOpen(false);
    setHearthOpen(false);
  }, []);

  const loadProfileForUser = useCallback(async (authUser: User) => {
    setIsLoggedIn(true);
    setUserId(authUser.id);

    if (activeProfileUserIdRef.current === authUser.id) {
      return;
    }

    activeProfileUserIdRef.current = authUser.id;
    const requestId = profileRequestIdRef.current + 1;
    profileRequestIdRef.current = requestId;

    setIsAdmin(false);
    setUserTier(DEFAULT_USER_TIER);
    setMyUsername('');
    setHasUnreadChat(false);
    setIsOpen(false);
    setHearthOpen(false);

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, role, username')
      .eq('id', authUser.id)
      .single();

    if (!isHeaderActiveRef.current || profileRequestIdRef.current !== requestId) {
      return;
    }

    if (error) {
      activeProfileUserIdRef.current = null;
      console.error('Header profile query failed.', error.code);
      setIsAdmin(false);
      setUserTier(DEFAULT_USER_TIER);
      setMyUsername('');
      setHasUnreadChat(false);
      return;
    }

    const profile = data as HeaderProfile | null;
    setUserTier(profile?.subscription_tier || DEFAULT_USER_TIER);
    setIsAdmin(profile?.role === 'admin');
    setMyUsername(profile?.username || '');
  }, [supabase]);

  useEffect(() => {
    isHeaderActiveRef.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isHeaderActiveRef.current) {
        return;
      }

      if (event === 'SIGNED_OUT' || !session?.user) {
        resetUserState();
        return;
      }

      void loadProfileForUser(session.user);
    });

    return () => {
      isHeaderActiveRef.current = false;
      profileRequestIdRef.current += 1;
      subscription.unsubscribe();
    };
  }, [loadProfileForUser, resetUserState, supabase]);

  // GLOBAL CHAT NOTIFICATION LISTENER FOR THE HEADER
  useEffect(() => {
    if (!myUsername || !userId) return;
    let isListening = true;
    const normalizedUsername = myUsername.toLowerCase();

    const headerChannel = supabase.channel(`header_notifications_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload: HeaderChatPayload) => {
        if (!isListening) {
          return;
        }

        const newMsg = payload.new;
        
        // 1. Did someone whisper to you?
        if (newMsg.recipient_id === userId) {
          setHasUnreadChat(true);
          return;
        }

        // 2. Did someone tag you in a public room?
        const text = newMsg.content?.toLowerCase() || '';
        const isTagged = text.includes(`@${normalizedUsername}`) || text.includes('@all');
        
        if (isTagged && newMsg.user_id !== userId) {
          setHasUnreadChat(true);
        }
      }).subscribe((status: RealtimeSubscribeStatus, error?: Error) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Header notification subscription failed.', error);
        }
      });

    return () => {
      isListening = false;
      void supabase.removeChannel(headerChannel).then((status: RealtimeRemovalStatus) => {
        if (status === 'error') {
          console.error('Header notification channel cleanup failed.');
        }
      });
    };
  }, [myUsername, userId, supabase]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Header sign-out failed.', error.message);
      return;
    }

    if (!isHeaderActiveRef.current) {
      return;
    }

    resetUserState();
    router.push('/login');
  };
    
  const shows = [
    { name: "The Bloom", href: "/dashboard/the-bloom" },
    { name: "Brindle's Vision", href: "/dashboard/brindles-vision" },
    { name: "Phoenix Talks", href: "/dashboard/phoenix-talks" },
    { name: "The CORE", href: "/dashboard/the-core" },
    { name: "Honky Tonk Heaven", href: "/dashboard/honky-tonk-heaven" },
    { name: "Defining Your Character", href: "/dashboard/defining-your-character" },
    { name: "Mystic Mist", href: "/dashboard/mystic-mist" }
  ];

  const closeHearth = () => {
    setHearthOpen(false);
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
    closeHearth();
  };

  const closeMobileChat = () => {
    closeMobileMenu();
    setHasUnreadChat(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full border-b border-orange-900/50 bg-black/95 backdrop-blur-md z-[100]">
      <div className="w-full px-8 py-4 flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="font-cinzel text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_8px_rgba(255,0,0,0.6)] uppercase tracking-[0.2em]">
            <span className="hidden sm:inline-block">Embers of Light</span>
            <span className="sm:hidden">EOL</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-10 ml-auto">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-6 xl:gap-10">
                {/* DESKTOP ADMIN LINK */}
                {isAdmin && (
                  <Link href="/dashboard/admin" className="text-orange-500 font-cinzel font-bold text-sm uppercase tracking-[0.2em] hover:text-orange-400 focus-visible:text-orange-400 transition-colors drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">
                    Admin Dashboard
                  </Link>
                )}

                <div
                  className="relative"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape' && hearthOpen) {
                      event.preventDefault();
                      closeHearth();
                      hearthButtonRef.current?.focus();
                    }
                  }}
                >
                  <button
                    ref={hearthButtonRef}
                    type="button"
                    aria-expanded={hearthOpen}
                    aria-controls="desktop-hearth-menu"
                    onClick={() => setHearthOpen((open) => !open)}
                    className="text-orange-500 font-cinzel font-bold uppercase tracking-[0.2em] hover:text-orange-400 focus-visible:text-orange-400 transition-colors flex items-center gap-2"
                  >
                    The Hearth <span aria-hidden="true" className={`transition-transform duration-300 ${hearthOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {hearthOpen && (
                    <div id="desktop-hearth-menu" className="absolute top-full left-0 mt-4 w-64 bg-black/95 border border-orange-900/50 backdrop-blur-xl flex flex-col py-2 z-[120] shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                      <Link
                        href="/dashboard"
                        onClick={closeHearth}
                        className="px-4 py-3 text-orange-400 font-cinzel text-sm font-bold uppercase tracking-widest hover:bg-orange-900/30 focus-visible:bg-orange-900/30 border-b border-orange-900/30"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href={`/sanctuary/${userTier}`}
                        onClick={closeHearth}
                        className="px-4 py-3 text-orange-400 font-cinzel text-sm uppercase tracking-widest hover:bg-orange-900/30 focus-visible:bg-orange-900/30 border-b border-orange-900/30"
                      >
                        My Sanctuary
                      </Link>
                      <Link
                        href="/chat"
                        onClick={() => {
                          closeHearth();
                          setHasUnreadChat(false);
                        }}
                        className="relative px-4 py-3 text-gray-300 font-cinzel text-sm uppercase tracking-widest hover:text-orange-400 hover:bg-orange-900/20 focus-visible:text-orange-400 focus-visible:bg-orange-900/20 border-b border-orange-900/30"
                      >
                        Chat
                        {hasUnreadChat && (
                          <span className="absolute top-3.5 right-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" aria-label="Unread chat messages"></span>
                        )}
                      </Link>
                      <Link
                        href="/community-standards"
                        onClick={closeHearth}
                        className="px-4 py-3 text-gray-300 font-cinzel text-sm uppercase tracking-widest hover:text-orange-400 hover:bg-orange-900/20 focus-visible:text-orange-400 focus-visible:bg-orange-900/20 border-b border-orange-900/30"
                      >
                        Standards
                      </Link>
                      {shows.map((show) => (
                        <Link
                          key={show.href}
                          href={show.href}
                          onClick={closeHearth}
                          className="px-4 py-2 text-gray-300 hover:text-orange-400 hover:bg-orange-900/20 focus-visible:text-orange-400 focus-visible:bg-orange-900/20 font-cinzel text-sm uppercase tracking-widest"
                        >
                          {show.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button onClick={handleSignOut} className="text-gray-300 font-cinzel text-sm uppercase tracking-[0.2em] hover:text-orange-400 focus-visible:text-orange-400 hover:bg-orange-600/20 focus-visible:bg-orange-600/20 px-4 py-2 rounded transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-orange-500 font-cinzel font-bold uppercase text-sm tracking-[0.3em] hover:text-orange-400 transition-colors">
              Log In
            </Link>
          )}
        </nav>

        {/* MOBILE HAMBURGER BUTTON */}
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => {
            setIsOpen((open) => !open);
            if (isOpen) closeHearth();
          }}
          className="ml-auto lg:hidden text-orange-500 p-2 text-2xl"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isOpen && (
        <div id="mobile-navigation" className="lg:hidden bg-black/95 border-b border-orange-900/50 px-8 py-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto shadow-2xl">
          {isLoggedIn ? (
            <>
              {/* MOBILE ADMIN LINK */}
              {isAdmin && (
                <Link href="/dashboard/admin" onClick={closeMobileMenu} className="text-orange-500 font-bold uppercase text-sm tracking-widest border-b border-orange-900/30 pb-4 font-cinzel drop-shadow-[0_0_8px_rgba(234,88,12,0.4)]">
                  Admin Dashboard
                </Link>
              )}

              <button
                type="button"
                aria-expanded={hearthOpen}
                aria-controls="mobile-hearth-menu"
                onClick={() => setHearthOpen((open) => !open)}
                className="text-orange-500 font-cinzel font-bold uppercase text-sm tracking-widest flex items-center justify-between"
              >
                <span>The Hearth</span>
                <span aria-hidden="true" className={`transition-transform duration-300 ${hearthOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {hearthOpen && (
                <div id="mobile-hearth-menu" className="flex flex-col gap-4 pl-4 border-l border-orange-900/30">
                  <Link href="/dashboard" onClick={closeMobileMenu} className="text-orange-400 font-bold uppercase text-sm tracking-widest font-cinzel">
                    Dashboard
                  </Link>
                  <Link href={`/sanctuary/${userTier}`} onClick={closeMobileMenu} className="text-orange-400 font-bold uppercase text-sm tracking-widest font-cinzel">
                    My Sanctuary
                  </Link>
                  <div className="relative w-max">
                    <Link href="/chat" onClick={closeMobileChat} className="text-gray-300 uppercase text-sm tracking-widest font-cinzel block">
                      Chat Sanctuary
                    </Link>
                    {hasUnreadChat && (
                      <span className="absolute top-1 -right-5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" aria-label="Unread chat messages"></span>
                    )}
                  </div>
                  <Link href="/community-standards" onClick={closeMobileMenu} className="text-gray-300 uppercase text-sm tracking-widest font-cinzel">
                    Standards
                  </Link>
                  {shows.map((show) => (
                    <Link
                      key={show.href}
                      href={show.href}
                      onClick={closeMobileMenu}
                      className="text-gray-300 uppercase text-sm tracking-widest font-cinzel"
                    >
                      {show.name}
                    </Link>
                  ))}
                </div>
              )}

              <button onClick={() => { closeMobileMenu(); void handleSignOut(); }} className="text-left text-gray-400 uppercase text-sm font-cinzel tracking-widest pt-4 border-t border-orange-900/20">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-left text-orange-500 uppercase text-sm font-bold font-cinzel pt-4 border-t border-orange-900/20 tracking-widest">
              Log In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
