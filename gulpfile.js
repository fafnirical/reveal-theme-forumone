const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');

const paths = {
  styles: {
    src: './src/sass',
    dist: './dist/css',
  },
};

// Build styles task
gulp.task('build:styles', () => (
  gulp
    .src(`${paths.styles.src}/**/*.scss`)
    .pipe(sassGlob())
    .pipe(
      sass({
        sourceMap: true,
        outFile: `${paths.styles.dist}/forumone.css`,
        outputStyle: 'expanded',
        includePaths: [
          './node_modules',
        ],
        quiet: true,
      }).on('error', sass.logError)
    )
    .pipe(gulp.dest(`${paths.styles.dist}`))
));
gulp.task('watch:styles', () => (
  gulp.watch(`${paths.styles.src}/**/*.scss`, ['build:styles'])
));

// Build task
gulp.task('build', ['build:styles']);
gulp.task('watch', ['watch:styles']);

// Default task
gulp.task('default', ['build']);
