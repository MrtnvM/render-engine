package com.max_mrtnv.render_android_playground.infrastructure.network

import com.google.gson.Gson
import com.max_mrtnv.render_android_playground.application.errors.ApplicationError
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

/**
 * Network client for making HTTP requests
 */
class NetworkClient(
    private val client: OkHttpClient = OkHttpClient(),
    private val gson: Gson = Gson()
) {
    suspend fun fetchData(url: String): String {
        return withContext(Dispatchers.IO) {
            val request = Request.Builder()
                .url(url)
                .build()
            
            try {
                val response = client.newCall(request).execute()
                
                if (!response.isSuccessful) {
                    throw ApplicationError.InvalidResponse("HTTP status code: ${response.code}")
                }
                
                response.body?.string() ?: throw ApplicationError.InvalidResponse("Empty response body")
            } catch (e: IOException) {
                throw ApplicationError.NetworkError(e.message ?: "Network request failed")
            } catch (e: ApplicationError) {
                throw e
            } catch (e: Exception) {
                throw ApplicationError.NetworkError(e.message ?: "Unknown network error")
            }
        }
    }
    
    suspend fun fetchJson(url: String): Map<String, Any?> {
        val data = fetchData(url)
        
        return try {
            // Use a more generic approach that handles LinkedTreeMap properly
            val result = gson.fromJson(data, Any::class.java)
            when (result) {
                is Map<*, *> -> result.mapKeys { it.key.toString() }.mapValues { it.value }
                else -> throw ApplicationError.ParsingError("JSON root is not an object")
            }
        } catch (e: Exception) {
            throw ApplicationError.ParsingError("Failed to parse JSON: ${e.message}")
        }
    }
}
