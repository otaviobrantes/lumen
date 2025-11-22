
import { createClient } from '@supabase/supabase-js';

// Chaves reais fornecidas pelo usuário
const supabaseUrl = 'https://zwljwjvyvsplmmmdgqmt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bGp3anZ5dnNwbG1tbWRncW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODM1NDQsImV4cCI6MjA3OTI1OTU0NH0.o7-H2rB2TnUdVxtGqEx5oRbuV2AZJHMzIxeQZ73AJXM';

// Cria o cliente Supabase oficial
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Nome do bucket único que você criou no Supabase
const BUCKET_NAME = 'uploads';

export const uploadFile = async (file: File, folder: 'videos' | 'thumbnails') => {
    // Gera um nome único para o arquivo para evitar conflitos e caracteres especiais
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Cria o caminho: pasta/arquivo (ex: videos/12345.mp4)
    // Isso organiza o bucket 'uploads' visualmente
    const filePath = `${folder}/${fileName}`;

    // Faz o upload para o bucket 'uploads' na pasta especificada
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error(`Erro no upload Supabase (${folder}):`, error);
        throw error;
    }

    // Recupera a URL pública do arquivo
    const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return publicUrl;
};
