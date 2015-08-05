# creates compressed version of frames within a given path.
# will replace the existing images

require 'shellwords'
path = '180/**/*jpg'

Dir[path].each do |file|
  image_path = Shellwords.escape(file)
  p image_path
  %x{sips -Z 320 #{image_path}}
end
