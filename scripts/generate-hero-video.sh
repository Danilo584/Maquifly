#!/usr/bin/env bash
# Animate the existing hero artwork; requires FFmpeg with libx264 and ffprobe.
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
source_image="$repo_root/public/hero-maquinaria.jpg"
output_dir="$repo_root/public/videos"

for tool in ffmpeg ffprobe; do
  command -v "$tool" >/dev/null || { echo "Missing dependency: $tool" >&2; exit 1; }
done
test -f "$source_image" || { echo "Missing source image: $source_image" >&2; exit 1; }
mkdir -p "$output_dir"
work_dir="$(mktemp -d "${TMPDIR:-/tmp}/maquifly-hero.XXXXXX")"
trap 'rm -rf -- "$work_dir"' EXIT

# Each sinusoidal movement has the same 12-second period, so playback wraps
# without a sudden change in framing. Oversampling reduces zoompan rounding.
zoom="1.02+0.025*(1-cos(2*PI*on/288))"
pan_x="(iw-iw/zoom)*(0.7+0.08*sin(2*PI*on/288))"
pan_y="(ih-ih/zoom)*(0.48+0.06*sin(2*PI*on/288))"

# A low-resolution, transparent warm haze is composited over the right-hand
# machinery and sky. Its drifting shape and light both repeat every 12 seconds.
haze_alpha="(13*exp(-((X/W-(0.79+0.055*sin(2*PI*T/12)))^2/0.045+(Y/H-(0.61+0.04*cos(2*PI*T/12)))^2/0.024))+8*exp(-((X/W-0.86)^2/0.017+(Y/H-0.27)^2/0.055)))*(0.85+0.15*cos(2*PI*T/12))"

encode_variant() {
  local name="$1" dimensions="$2" framing="$3" maxrate="$4" buffer="$5"
  local filter
  filter="[0:v]${framing},zoompan=z='$zoom':x='$pan_x':y='$pan_y':d=288:s=$dimensions:fps=24,setsar=1[scene];color=c=0xf6c27a:s=400x150:r=24:d=12,format=rgba,geq=r=246:g=194:b=122:a='$haze_alpha',scale=$dimensions[haze];[scene][haze]overlay=shortest=1:format=auto,scale=out_range=tv,format=yuv420p,setparams=range=limited[out]"

  ffmpeg -hide_banner -loglevel warning -nostdin -y \
    -filter_complex_threads 2 -i "$source_image" \
    -filter_complex "$filter" -map '[out]' -an -t 12 \
    -c:v libx264 -threads 2 -preset slow -crf 25 \
    -maxrate "$maxrate" -bufsize "$buffer" \
    -profile:v high -level:v 4.0 -pix_fmt yuv420p -color_range tv \
    -g 48 -keyint_min 48 -sc_threshold 0 \
    -movflags +faststart -map_metadata -1 \
    "$work_dir/$name.mp4"

  ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate:format=duration,size \
    -of json "$work_dir/$name.mp4"
  mv -- "$work_dir/$name.mp4" "$output_dir/$name.mp4"
}

encode_variant maquifly-hero 1600x600 'scale=4096:1536:flags=lanczos' 1100k 2200k
encode_variant maquifly-hero-mobile 540x720 'scale=4096:1536:flags=lanczos,crop=1152:1536:(iw-ow)*0.7:0' 550k 1100k
