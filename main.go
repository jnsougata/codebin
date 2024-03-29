package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	app := gin.Default()
	app.GET("/", func(c *gin.Context) {
		c.File("static/app.html")
	})
	app.GET("/editor/:id", func(c *gin.Context) {
		c.File("static/editor.html")
	})
	app.GET("/shared/:id", func(c *gin.Context) {
		c.File("static/view.html")
	})
	app.Static("/assets", "assets")
	app.Static("/styles", "styles")
	app.Static("/scripts", "scripts")
	app.Static("/modes", "modes")
	api := app.Group("/api")
	api.Any("/bins", bins)
	api.Any("/bin/:id", bin)
	api.GET("/public/bin/:id", public)
	app.Run(":8080")
}
