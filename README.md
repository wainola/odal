### TODO => long term

- ~~if registry doesnt exists, create it.~~
- ~~`sql` files must include inside the down clause.~~
- ~~make test for the core functionalities.~~
- ~~decouple logic inside the entry points cause its a mess.~~
- solve problem related to multiples queries on one file.
- pretty print status of migrations (priority).
- use table on db to store the current migrations. If one migrations is on storage, change the attribute up (priority).
- read some configuration file on `.yml` format (priority).
- ~~add markup to the `.sql` with `up` and `down`.~~
- make command init to setup everything

## DEVELOPMENT

In order to start the project you need to setup an instance of postgres to run some test that requires a database connection. Run `npm run d-build` and then `npm run d-up` to get the postgres image up and running. If you want, you can inspect the container by using `npm run d-inspect`.

If you want to check the database that we are using to run some test, you can use the command `npm run d-postgres`. You will be able to see the tables that the program is creating. Also you can use this instance to debug your migrations methods.

Once you do this, you can run `npm link` to enable the cli in your local environment. After this, you can use `odal init` to setup the migrations folder. This folder should contain a registry folder and a `config.js` file to
