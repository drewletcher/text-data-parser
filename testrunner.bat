REM Run tasks from launch.json where "program" includes LAUNCH_PROGRAM
REM and "name" includes %1 argument, if defined.
REM tr_launcher is a node.js bin script in @oby4/storage-lib project.
SET NODE_ENV=development
SET LOG_LEVEL=verbose
SET COMPARE_VALUES=3
SET LAUNCH_PROGRAM=te
tr_launcher %1
