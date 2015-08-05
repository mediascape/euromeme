# Creates directory structure for frame images outputted from ffmpeg
require 'fileutils'
require 'time'

def dir_from_time(time)
  File.join File.dirname(__FILE__), time.strftime('%Y/%m/%d/%H/%M/%S/')
end

filename = 'frame-*.jpg'
frames_per_second = 5
current_time = Time.mktime(2015,05,23,20,0,0)

Dir[filename].each_with_index do |f, i|
  mod_frame = i % frames_per_second

  if mod_frame === 0
    # iterate time (unless this is the first frame)
    current_time += 1 unless i == 0
  end

  frame_num = String(mod_frame + 1)
  path = dir_from_time(current_time)

  FileUtils.mkdir_p(path, verbose:true)
  FileUtils.mv(f, File.join(path, frame_num+'.jpg'), verbose: true)
end
