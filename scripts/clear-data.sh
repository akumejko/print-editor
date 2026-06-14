#!/bin/bash
fly ssh console -a print-editor -C "rm -rf /data/saved_projects/* /data/projects.db"
echo "Done. Database and saved projects cleared."
