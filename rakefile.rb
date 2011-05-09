task :default => 'all'

# openlayers_dir = File.join( lib_dir, 'openlayers' )
# openlayers = File.join( openlayers_dir, 'readme.md' )
polymaps = File.join( 'lib', 'polymaps' )

task :all => [:init] do
  puts "MapQuery build complete."
end

task :init => [ polymaps ] do

  #sh "cd \"#{openlayers_dir}\"; git checkout master" #master is release branch atm
  #sh "cd \"#{openlayers_dir}/build/\"; ./build.py;"
  #FileUtils.mv "#{openlayers_dir}/build/OpenLayers.js", "#{openlayers_dir}"
  sh "cd \"#{polymaps}\"; git pull origin master"
end

# file openlayers do

#   puts 'Retrieving OpenLayers...'
#   #sh "curl -o #{lib_dir}/openlayers.js http://openlayers.org/api/OpenLayers.js"
#   sh "git clone git://github.com/openlayers/openlayers.git #{openlayers_dir}"
# end

file polymaps do
  sh "git clone git://github.com/simplegeo/polymaps.git #{polymaps}"
end
