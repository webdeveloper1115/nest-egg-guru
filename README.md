# Nest Egg Guru
Nest Egg Guru offers a new way to obtain meaningful answers to two of the most common and important financial planning questions – “How much will I have saved at retirement?” and “How long will my retirement nest egg last after I retire?”

## Application Setup

### Node.js and Gulp

You will need to first install [Node.js](http://nodejs.org/download/) (Requires Node v0.12.7) and the gulp: ```npm install -g gulp``` and ```brew install redis-server```

1) Clone this repo:
```bash
    $ git clone git@bitbucket.org:sudokrew/nest-egg-white-label.git


    $ cd nest-egg-white-label
```

2) Clone the ghost blog into ```ghost```

3) Clone the nest-egg-calculator into ```app > lib```

4) Set up .env file in root.


*  You will need to create new accounts for Stormpath and Stripe. For Stripe, you’ll need to create two monthly subscriptions in stripe Plans:
     * `financialProfessionalMonthly` at $30/mo and
     * `financialProfessionalYearly` at $300/yr

* You will also need to setup and configure a AWS account.

    * Set up S3
    * Creating a bucket
    * Creating a user which you will get API keys
    * Set up bucket permissions which you'll want only the api key holder to be able to GetObject/PutObject/DeleteObject but
    * Set up bucket polciy so that users to be able to GetObject.


```
{
    ...

    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AddPerm",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::[bucket-name]/*"
        }
    ]
}
```


Example .env file

```bash
    ADMIN_USER=???

    EXPRESS_SECRET=???

    DB_PSWD=???

    MADMIMI_API_KEY=???
    MAILGUN_PSWD=???

    STORMPATH_API_KEY_ID=???
    STORMPATH_API_KEY_SECRET=???
    STORMPATH_APP_HREF=https://api.stormpath.com/v1/applications/????

    STRIPE_PUBLIC_KEY=???
    STRIPE_SECRET_KEY=????

    AWS_ACCESS_KEY_ID=???
    AWS_SECRET_ACCESS_KEY=???

    SEED_DATA=???
```

5) Set up postgres DB and seed DB:

* Setup a new postgreSQL database on your local machine.

* Configure application to connect to local database. In ```app > config > env > development.js``` enter your databse information:

     Example development.js snippet
```
    ...

    database : {
    host : 'localhost',
    database_name : 'datbase_name',
    username : 'username',
    port : '5432' //default PSQL port
    }
```

6) Once you have confirmed that the application is connected to our DB, seed you DB by adding the following line to .env.
    * Note: You only need to seed the DB once. When you have seeded the DB, remove this line or else you are going to have a bad time.

```
    SEED_DATA="seed"
```

7) reset environment variables for

```bash
    $ source .env
```

8) Seup and install submodule for calculators and ghost blog.

*  ```nest-egg-calculator``` should be placed in ```app > lib```
* ```nest-egg-guru-blog``` should be placed in ```ghost```
* Install the submodules by running this command.

```bash
    $ git submodule init
    $ git submodule update
```

9) Install dependencies.. this will `bower install` after npm is done

```bash
    $ npm install
```

10) Set environment variables for Stormpath and AWS.

```bash
    $ source .env
```

11) Start redis server

```bash
    $ redis-server
```

12) Start tasks:

```bash
    $ gulp
```

## Troubleshooting
* When troubleshooting user sessions, clear the cache on the redis server - run this command to clear user sessions.

```bash
    $ redis-cli flushall
```

* User and product databases on Stripe, Stormpath, and local storage must be insync. If you delete from one, you must be sure to delete from all.

## Contributing
1. Fork it!
2. Create your feature branch: ```git checkout -b my-new-feature```
3. Commit your changes: ```git commit -am 'Add some feature'```
4. Push to the branch: ````git push origin my-new-feature````
5. Submit a pull request :D

CHEERS!