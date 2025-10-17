import yt_dlp
import os
import re


def sanitize_filename(name: str) -> str:
    return re.sub(r"[^0-9A-Za-z. _-]", "", name)


def list_formats(url: str) -> dict:
    ydl_opts = {
        'skip_download': True, 
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
    
    # Get all formats
    all_formats = info.get('formats', [])
    
    # Get the original language of the video
    original_lang = info.get('language') or 'en'
    
    # Helper function to check if format has original language audio
    def has_original_audio(f):
        # If no language specified, assume it's original
        lang = f.get('language')
        audio_lang = f.get('audio_language') 
        
        if not lang and not audio_lang:
            return True
        
        # Check if language matches original or is undefined
        if lang and lang != 'und':
            return lang == original_lang
        if audio_lang and audio_lang != 'und':
            return audio_lang == original_lang
            
        return True  # If undefined, assume original
    
    # Create curated quality options
    curated = []
    
    # Best audio only (M4A/AAC) - with original language
    audio_formats = [f for f in all_formats 
                    if f.get('acodec') != 'none' 
                    and f.get('vcodec') == 'none'
                    and has_original_audio(f)]
    
    # Fallback to all audio formats if no original language found
    if not audio_formats:
        audio_formats = [f for f in all_formats 
                        if f.get('acodec') != 'none' 
                        and f.get('vcodec') == 'none']
    
    if audio_formats:
        best_audio = max(audio_formats, key=lambda x: x.get('abr', 0) or 0)
        curated.append({
            'quality': 'M4A',
            'label': 'AAC',
            'type': 'Audio Only',
            'format_id': best_audio.get('format_id'),
            'ext': best_audio.get('ext', 'm4a'),
            'filesize': best_audio.get('filesize') or best_audio.get('filesize_approx'),
            'height': None,
        })
    
    # Video + Audio combined formats at different resolutions - with original language
    video_audio_formats = [f for f in all_formats 
                          if f.get('vcodec') != 'none' 
                          and f.get('acodec') != 'none'
                          and has_original_audio(f)]
    
    # Fallback to all video+audio formats if no original language found
    if not video_audio_formats:
        video_audio_formats = [f for f in all_formats 
                              if f.get('vcodec') != 'none' 
                              and f.get('acodec') != 'none']
    
    resolutions = [2160, 1440, 1080, 720, 480, 360, 240, 144]
    for res in resolutions:
        matching = [f for f in video_audio_formats if f.get('height') == res]
        if matching:
            best = max(matching, key=lambda x: x.get('tbr', 0) or 0)
            curated.append({
                'quality': f'{res}p',
                'label': 'FHD' if res == 1080 else ('HD' if res == 720 else ''),
                'type': 'Video + Audio',
                'format_id': best.get('format_id'),
                'ext': best.get('ext', 'mp4'),
                'filesize': best.get('filesize') or best.get('filesize_approx'),
                'height': res,
            })
    
    # If no combined formats, we'll need to merge best video + best audio
    if not video_audio_formats or len([c for c in curated if c.get('height')]) == 0:
        video_only = [f for f in all_formats 
                     if f.get('vcodec') != 'none' 
                     and f.get('acodec') == 'none']
        
        # Get best audio for merging
        best_audio_obj = max(audio_formats, key=lambda x: x.get('abr', 0) or 0) if audio_formats else None
        
        for res in resolutions:
            matching = [f for f in video_only if f.get('height') == res]
            if matching:
                best_video = max(matching, key=lambda x: x.get('tbr', 0) or 0)
                best_audio_id = best_audio_obj.get('format_id') if best_audio_obj else None
                format_spec = f"{best_video.get('format_id')}+{best_audio_id}" if best_audio_id else best_video.get('format_id')
                
                video_size = best_video.get('filesize') or best_video.get('filesize_approx') or 0
                audio_size = best_audio_obj.get('filesize') or best_audio_obj.get('filesize_approx') or 0 if best_audio_obj else 0
                total_size = video_size + audio_size if video_size and audio_size else None
                
                curated.append({
                    'quality': f'{res}p',
                    'label': 'FHD' if res == 1080 else ('HD' if res == 720 else ''),
                    'type': 'Video + Audio',
                    'format_id': format_spec,
                    'ext': 'mp4',
                    'filesize': total_size,
                    'height': res,
                })
    
    return {
        'title': info.get('title'),
        'id': info.get('id'),
        'uploader': info.get('uploader'),
        'formats': curated,
    }


def download_video(url: str, format_id: str, out_dir: str, extract_audio: bool = False):
    os.makedirs(out_dir, exist_ok=True)
    ydl_opts = {
        'format': format_id,
        'outtmpl': os.path.join(out_dir, '%(title)s.%(ext)s'),
        'quiet': True,
        'noplaylist': True,
        'merge_output_format': 'mp4',  # Ensure merged formats are mp4
        # Prefer original language audio
        'subtitleslangs': ['en', '-live_chat'],
        'postprocessor_args': {
            'ffmpeg': ['-c:a', 'copy', '-c:v', 'copy']  # Copy streams without re-encoding
        },
    }
    if extract_audio:
        ydl_opts.update({'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }]})

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    # Resolve path
    title = info.get('title')
    ext = 'mp3' if extract_audio else info.get('ext')
    filename = sanitize_filename(f"{title}.{ext}")
    out_path = os.path.join(out_dir, filename)
    # yt-dlp may have written a different filename if title had characters removed;
    # search for created file
    for f in os.listdir(out_dir):
        if f.lower().startswith(sanitize_filename(title).lower()[:8]):
            out_path = os.path.join(out_dir, f)
            filename = f
            break
    return out_path, filename
