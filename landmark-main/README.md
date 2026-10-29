# deployment chjk

# framework-backend

### Generate migration file under module folder.

```
node migration.js --generate:<table | alter | seeder>-{expectated file name} [create migration file]
```

### Run migrations.

```
node migration.js --migrate [migrate all files/folders]
or
node migration.js --migrate:<tables|alters|views|procs> [migrate given specific folder]
```
