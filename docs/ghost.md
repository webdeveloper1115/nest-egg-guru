* Ghost blog is to be ran as a separate app
* Set up to be a submodule in this project in ghost

# Set up
- first run
```bash
$ git submodule init
```
- Then update
```bash
$ git submodule update
```
- Change directories to submodule
```bash
$ cd ghost/nest-egg-guru-blog
```
- Checkout master and pull
```bash
$ git checkout master && git pull
```

#Login
Username: janette@sudokrew.com
password: sh3rl0ck

## Helper method "excerpt" modified:
- allows to allow pictures in the index view
- nest-egg-guru-blog/core/server/helpers/excerpt.js (line 28 is commented out)

## Splint for dynamic domains contingent on NODE_ENV
- allows for hyperlinks to route properly depending on env:
  - development
  - production
- located in ghost/nest-egg-guru-blog/index.js (lines 21-36)
- for it to work in development you must be in the directory and have node running
