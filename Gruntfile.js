
module.exports = function (grunt) {

    grunt.initConfig({
        sass: {                            
            dist: {                        
              options: {                     
                style: 'compact',
                sourcemap: true
              },
              files: {                        
                'css/main.css': 'scss/main.scss'
              }
            }
        },
		watch: {
            scripts: {
                files: 'scss/*.scss',
                tasks: ['sass'],
                options: {
                    interrupt: true
                }
            }
        }

    });

    /** Load Grunt Tasks */
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['']);
    grunt.registerTask('watchStyles', ['watch']);
   
};