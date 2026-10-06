# import os
# from openai import OpenAI
# from dotenv import load_dotenv

# from services.product_service import (
#     search_products,
#     search_products_by_max_price
# )

# load_dotenv()

# client = OpenAI(
#     api_key=os.getenv("OPENAI_API_KEY")
# )


# def process_chat(message):

#     # Convert message into words
#     words = message.lower().split()

#     # Extract maximum price
#     max_price = None

#     for word in words:
#         clean_word = word.replace("₹", "").replace(",", "")

#         if clean_word.isdigit():
#             max_price = int(clean_word)

#     # Words that are not useful for product search
#     stop_words = [
#         "show",
#         "me",
#         "find",
#         "get",
#         "give",
#         "i",
#         "want",
#         "products",
#         "product",
#         "please",
#         "under",
#         "below",
#         "less",
#         "than"
#     ]

#     # Extract search words
#     search_words = []

#     for word in words:

#         clean_word = word.replace("₹", "").replace(",", "")

#         # Skip price
#         if clean_word.isdigit():
#             continue

#         # Skip unnecessary words
#         if word in stop_words:
#             continue

#         search_words.append(word)

#     search_word = " ".join(search_words)

#     # Get products from MongoDB
#     if max_price:

#         products = search_products_by_max_price(
#             search_word,
#             max_price
#         )

#     else:

#         products = search_products(search_word)

#     # No products found
#     if not products:

#         return "Sorry, no matching products were found on OneCart."

#     # Prepare product information
#     product_context = ""

#     for product in products:

#         product_context += f"""
# Product: {product.get("name")}
# Category: {product.get("category")}
# Price: ₹{product.get("price")}
# Stock: {product.get("stock")}
# Rating: {product.get("rating")}
# Description: {product.get("description")}
# """

#     # Send request to OpenAI
#     try:

#         response = client.responses.create(

#             model="gpt-5.6-luna",

#             instructions="""
# You are the OneCart E-Commerce assistant.

# Help customers with:
# - Products
# - Categories
# - Shopping recommendations
# - General E-Commerce questions

# Be helpful, clear, and concise.

# Important rules:

# - OneCart is an Indian ecommerce website.
# - Always use Indian Rupees (₹) when discussing prices.
# - Never use dollars ($) or other currencies unless the customer specifically asks.
# - Only use product information provided by OneCart.
# - Do not make up product information.
# - If the provided products do not contain the answer, say that the information is not available.
# - Keep responses short and useful.
# """,

#             input=f"""
# Customer Question:
# {message}

# OneCart Products:
# {product_context}
# """
#         )

#         return response.output_text

#     except Exception as error:

#         print("OPENAI ERROR:", error)

#         return "Sorry, the chatbot is temporarily unavailable. Please try again later."

#========================================================================================

import os

from dotenv import load_dotenv
from google import genai

from services.product_service import (
    search_products,
    search_products_by_max_price
)


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options={
        "timeout" : 60000
    }
)


def process_chat(message):

    # Convert message into words
    words = message.lower().split()


    # Extract maximum price
    max_price = None

    for word in words:

        clean_word = word.replace("₹", "").replace(",", "")

        if clean_word.isdigit():
            max_price = int(clean_word)


    # Words that are not useful for product search
    stop_words = [
        "show",
        "me",
        "find",
        "get",
        "give",
        "i",
        "want",
        "products",
        "product",
        "please",
        "under",
        "below",
        "less",
        "than"
    ]


    # Extract search words
    search_words = []

    for word in words:

        clean_word = word.replace("₹", "").replace(",", "")

        # Skip price values
        if clean_word.isdigit():
            continue

        # Skip unnecessary words
        if word in stop_words:
            continue

        search_words.append(word)


    search_word = " ".join(search_words)


    # Get products from MongoDB
    if max_price:

        products = search_products_by_max_price(
            search_word,
            max_price
        )

    else:

        products = search_products(search_word)

    # Check if no products were found
    if not products:
        return "Sorry, no matching products were found on OneCart."

    # Prepare product information for Gemini
    product_context = ""

    for product in products:

        product_context += f"""
        Product: {product.get("name")}
        Price: ₹{product.get("price")}
        """


    # Send product data + customer question to Gemini
    try :
        interaction = client.interactions.create(
            model="gemini-3.6-flash",
            input=f"""
            Customer Question:
            {message}

            OneCart Products:
            {product_context}

            You are the OneCart E-Commerce assistant.

            Help customers with:
            - Products
            - Categories
            - Shopping recommendations
            - General E-Commerce questions

            Be helpful, clear, and concise.

            Important rules:
            - OneCart is an Indian ecommerce website.
            - Always use Indian Rupees (₹) when discussing prices.
            - Never use dollars ($) or other currencies unless the customer specifically asks.
            - Only use product information provided in OneCart Products.
            - Do not make up product information.
            """
        )

        return interaction.output_text

    except Exception as error :
        print("GEMINI ERROR : ",error)
        return "Sorry, the AI assitant is temporarily unavailable. Please try again later"