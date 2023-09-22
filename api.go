package main

import (
	"codebin/deta"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type Bin struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

var base = deta.New(os.Getenv("DETA_PROJECT_KEY")).Base("codebin")

func bin(c *gin.Context) {

	switch c.Request.Method {

	case http.MethodGet:
		id := c.Param("id")
		query := deta.NewQuery()
		query.Equals("parent", id)
		resp := base.FetchUntilEnd(query)
		records := resp.ArrayJSON()
		for _, record := range records {
			record["id"] = record["key"]
			delete(record, "key")
		}
		c.JSON(resp.StatusCode, records)

	case http.MethodPut:
		var bin map[string]interface{}
		c.BindJSON(&bin)
		resp := base.Put(deta.Record{Key: bin["id"].(string), Value: bin})
		c.JSON(resp.StatusCode, resp.JSON())

	case http.MethodDelete:
		id := c.Param("id")
		resp := base.Delete(id)
		c.JSON(resp.StatusCode, resp.JSON())
	}
}

func bins(c *gin.Context) {

	switch c.Request.Method {

	case http.MethodGet:
		query := deta.NewQuery()
		query.Equals("type", "parent")
		resp := base.FetchUntilEnd(query)
		c.JSON(resp.StatusCode, resp.ArrayJSON())

	case http.MethodPut:
		var bin map[string]interface{}
		c.BindJSON(&bin)
		resp := base.Put(deta.Record{Value: bin})
		c.JSON(resp.StatusCode, resp.JSON())

	case http.MethodPatch:
		var bin Bin
		c.BindJSON(&bin)
		updater := deta.NewUpdater(bin.Id)
		updater.Set("name", bin.Name)
		updater.Set("description", bin.Description)
		resp := base.Update(updater)
		c.JSON(resp.StatusCode, resp.JSON())

	case http.MethodDelete:
		var bin Bin
		c.BindJSON(&bin)
		resp := base.Delete(bin.Id)
		q := deta.NewQuery()
		q.Equals("parent", bin.Id)
		children := base.FetchUntilEnd(q)
		for _, child := range children.ArrayJSON() {
			base.Delete(child["key"].(string))
		}
		c.JSON(resp.StatusCode, resp.JSON())
	}
}
