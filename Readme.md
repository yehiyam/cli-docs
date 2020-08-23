# cli-docs  
Tool for creating markdown Readme documentation for cli tools created with
[yargs](https://github.com/yargs/yargs)  
## Install  
```shell  
npm i -g cli-docs  
```  
## Usage  
## cli-docs  
---  
```shell  
$ cli-docs   
```  
Tool for creating markdown Readme documentation for cli tools created with
[yargs](https://github.com/yargs/yargs)    
Options:    

  
|option|description|type|required|default|  
|---|---|---|---|---|  
|--help|Show help|boolean|||  
|--version|Show version number|boolean|||  
|--path|path to the cli executable|string|true||  
|--name|real name of the cli. If omitted, the name of the executable is used|string|||  
|--output, -o|the output file.|string||./Readme.md|  
|--installTemplate|replaces the default how to install.|string|||