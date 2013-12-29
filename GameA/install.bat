@echo off

set appname=¹ûÖ­Ó¢Óï
if exist %appname%.fav (goto :copyfav) else (goto :createfav)
set path=%cd%

:createfav
echo url:%cd:\=/%/index.cc6>%appname%.fav
echo type:1>>%appname%.fav
echo flags:0>>%appname%.fav
echo name:%appname%>>%appname%.fav
echo localfirst:true>>%appname%.fav
echo toolbar:false>>%appname%.fav
echo menu:false>>%appname%.fav
echo fullscreen:true>>%appname%.fav
tools\dos2unix.exe %appname%.fav >nul 2>nul
goto :copyfav

:copyfav
for /f "tokens=2,*" %%i in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders" /v "Desktop"') do (
set desk=%%j
)
echo move %appname%.fav %desk%
move %appname%.fav "%desk%"