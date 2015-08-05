package main

import (
	"fmt"
	"net/http"
	"os"
)

var mediascapeKey string

func main() {
	mediascapeKey = os.Getenv("MEDIASCAPE_API")
	port := os.Getenv("MEDIASCAPE_PORT")

	if mediascapeKey == "" {
		panic("MEDIASCAPE_API is not defined")
	}

	if port == "" {
		port = "17901"
	}

	http.HandleFunc("/", apiCheck)
	fmt.Println("Serving on port " + port)
	panic(http.ListenAndServe(":"+port, nil))
}

func apiCheck(w http.ResponseWriter, r *http.Request) {
	serveFile := r.FormValue("k") == mediascapeKey
	path := r.URL.Path[1:]

	if serveFile {
		fmt.Println(path + " found")
		http.ServeFile(w, r, "public/"+path)
	} else {
		fmt.Println(path + " not found")
		w.WriteHeader(http.StatusUnauthorized)
	}
}
