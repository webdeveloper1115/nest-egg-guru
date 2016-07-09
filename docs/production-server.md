# Production server configuration and release procedures #

Both production and staging instances are runing as Forever processes. Forever is not set to autostart after a server restart and the apps need to be started explicitly. Currently there is no continuous integration implemented. Updates must be released explicitly to both staging and production.

Routing uses nginx. setup     

- view running processes: 

    ~~~
    $ sudo forever list
    ~~~

## Staging ##

- URL: https://staging.nesteggguru.com
- Site path: /home/nestegg/apps/staging-nest-egg-guru 
    - local port: 8200
- Blog path: /home/nestegg/apps/staging-nest-egg-guru/ghost/nest-egg-guru-blog
    - local port: not running
- nginx config: deploy/files/staging/nesteggguru

### START ###

- go to the **staging** folder
- run startup script:
    ~~~
    $ bash deploy/files/staging/startforever.sh
    ~~~
- staging instance will be running under the name `staging-nest-egg-guru`


### STOP ###

- go to the **staging** folder
- run startup script:
    ~~~
    $ bash deploy/files/staging/stopforever.sh
    ~~~

### RESTART ###

- go to the **staging** folder
- run startup script:
    ~~~
    $ bash deploy/files/staging/restartforever.sh
    ~~~



### RELEASE ###
The following steps update the staging instance with the latest version from a specific branch, builds the app and restarts the Forever process for it 

- go to the staging folder

- change to the branch containing the new development
    ~~~
    $ git checkout <branch>
    ~~~
- run staging release script
    ~~~
    $ bash staging-deploy.sh
    ~~~


## Production ##

- URL: https://www.nesteggguru.com
- Site path: /home/nestegg/apps/nest-egg-guru 
    - local port: 8000
- Blog path: /home/nestegg/apps/nest-egg-guru/ghost/nest-egg-guru-blog
    - local port: 2368
- nginx config: deploy/files/production/nesteggguru


### START ###

- go to the **production** folder
- run startup script:
    ~~~
    $ bash deploy/files/production/startforever.sh
    ~~~
- production instance will be running under the name `nest-egg-guru` and blog will be running under the name `nest-egg-guru-blog` 


### STOP ###

- go to the **production** folder
- run startup script:
    ~~~
    $ bash deploy/files/production/stopforever.sh
    ~~~

### RESTART ###

- go to the **production** folder
- run startup script:
    ~~~
    $ bash deploy/files/production/restartforever.sh
    ~~~

### RELEASE ###
The following steps update the **production** instance with the latest version from the master branch, builds the app and restarts the Forever process for it 

- go to the **production** folder

- run **production** release script
    ~~~
    $ bash deploy.sh
    ~~~
