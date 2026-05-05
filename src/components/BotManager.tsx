'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function BotManager() {
  const [bots, setBots] = useState<any[]>([]);
  const [triggerWord, setTriggerWord] = useState('');
  const [responseText, setResponseText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  // Load existing bots on load
  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    const { data, error } = await supabase
      .from('chat_commands')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setBots(data);
    if (error) console.error("Error fetching bots:", error);
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUploading(true);

    // 1. Format the trigger word (force lowercase, remove any accidental spaces)
    let formattedTrigger = triggerWord.toLowerCase().trim();

    // 2. Validate the rule we set in the database (Must have text OR image)
    if (!responseText.trim() && !imageFile) {
      setError('You must provide either a text response or an image!');
      setIsUploading(false);
      return;
    }

    try {
      let imageUrl = null;

      // 3. Upload Image if they attached one
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('bot-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Get the public URL for the chatroom to display
        const { data: publicUrlData } = supabase.storage
          .from('bot-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }

      // 4. Save to Database
      const { error: dbError } = await supabase
        .from('chat_commands')
        .insert([{
          trigger_word: formattedTrigger,
          response_text: responseText.trim() || null,
          image_url: imageUrl
        }]);

      if (dbError) {
        if (dbError.code === '23505') throw new Error('That trigger word already exists!');
        throw dbError;
      }

      // 5. Cleanup form on success
      setTriggerWord('');
      setResponseText('');
      setImageFile(null);
      fetchBots(); // Refresh the list

    } catch (err: any) {
      setError(err.message || 'Something went wrong creating the bot.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string | null) => {
    if (!confirm('Are you sure you want to delete this bot?')) return;

    // Delete from Database
    await supabase.from('chat_commands').delete().eq('id', id);

    // Try to clean up the image from storage so it doesn't take up space
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('bot-images').remove([fileName]);
      }
    }
    
    fetchBots(); // Refresh the list
  };

  return (
    <div className="bg-black/40 border border-orange-900/30 rounded-xl p-6 font-cormorant text-gray-200">
      <h2 className="font-cinzel text-2xl text-orange-400 mb-6 border-b border-orange-900/30 pb-2">
        Chat Bot Commander
      </h2>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-6">
          {error}
        </div>
      )}

      {/* CREATE NEW BOT FORM */}
      <form onSubmit={handleCreateBot} className="space-y-4 mb-10 bg-black/60 p-4 rounded-lg border border-orange-500/20">
        <h3 className="font-cinzel text-lg text-orange-300">Create New Trigger</h3>
        
        <div>
          <label className="block text-sm text-gray-400 mb-1 tracking-widest uppercase">Trigger Word (e.g., submit, songs, help)</label>
          <input 
            type="text" 
            required 
            value={triggerWord}
            onChange={(e) => setTriggerWord(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-200 focus:border-orange-500 outline-none"
            placeholder="Type a word..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1 tracking-widest uppercase">Response Text (Optional)</label>
          <textarea 
            rows={3}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-gray-200 focus:border-orange-500 outline-none"
            placeholder="Type the message the bot will reply with... Paste links here!"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1 tracking-widest uppercase">Attach Image (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20"
          />
        </div>

        <button 
          type="submit" 
          disabled={isUploading}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-cinzel tracking-widest uppercase py-2 rounded transition-colors disabled:opacity-50"
        >
          {isUploading ? 'Creating Bot...' : 'Deploy Bot'}
        </button>
      </form>

      {/* ACTIVE BOTS LIST */}
      <div>
        <h3 className="font-cinzel text-lg text-orange-300 mb-4">Active Bots</h3>
        {bots.length === 0 ? (
          <p className="text-gray-500 italic">No bots deployed yet.</p>
        ) : (
          <div className="space-y-3">
            {bots.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between bg-gray-900/50 border border-gray-800 p-3 rounded">
                <div>
                  <span className="font-bold text-orange-400 mr-3">"{bot.trigger_word}"</span>
                  <span className="text-sm text-gray-400 truncate max-w-xs inline-block align-bottom">
                    {bot.response_text ? bot.response_text : '[Image Only Bot]'}
                  </span>
                </div>
                <button 
                  onClick={() => handleDelete(bot.id, bot.image_url)}
                  className="text-red-500 hover:text-red-400 text-sm font-bold uppercase tracking-wider px-2 py-1 border border-red-900/30 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}