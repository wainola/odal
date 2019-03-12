### TODO => long term

- create services for mysql and sqlite.
- rename service database to postgres.
- if registry doesnt exists, create it.
- `sql` files must include inside the down clause.
- make test for the core functionalities.
- decouple logic inside the entry points cause its a mess.
- solve problem related to multiples queries on one file.

### TODO => short term

- pretty print status of migrations (priority).
- use table on db to store the current migrations. If one migrations is on storage, change the attribute up (priority).
- read some configuration file on `.yml` format (priority).
- we can create migration passing strings on terminal with the format `"attr type others" "attr type other"`.
- add markup to the `.sql` with `up` and `down`.
