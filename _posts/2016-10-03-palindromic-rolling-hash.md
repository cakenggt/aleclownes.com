---
layout: plain_page
title: Palindromic Rolling Hash
---
# Palindromic Rolling Hash

In the world of interview algorithms, interviewees often come across a problem similar to the following:

`Given a string, find the longest palindrome contained in that string`

This is known as the `longest palindromic substring` problem, and has well documented solutions for several algorithmic complexities. The best algorithm is called `Manacher's algorithm` and is guaranteed to run in O(n) time.

While not as good as Manacher's Algorithm, I wanted to float a novel approach to the problem, which I call `Palindromic Rolling Hash`, which solves the problem in average O(n) time. Assuming you have a rolling hash algorithm that can add a character or remove a character from the front or back in O(1) time and can produce a hash in O(1) time, the Palindromic Rolling Hash object would consist of two rolling hashes, each containing one half of the word, that are flipped versions of each other (and an additional unhashed character for odd length words). A palindrome check on this object will take O(1) time for false and O(n) time for true.

For the word `ticket`, the object would look like this:

Rolling Hash 1 contents: `tic`

Rolling Hash 2 contents: `tek`

Once you have this object, and the internal logic which allows you to add a character to the overall length of the Palindromic Rolling Hash, or subtract it, and have the internal hashes recompute in O(1) time, the following steps can be used to find the largest palindrome. I will start partway into the process, as there are some weirdnesses at the beginning and end of the string that require extra logic.

1. Check to see if the selection is currently a palindrome
2. If it is, add the next character and the preceeding character to the rolling hash and go to step 1.
3. If it is not, add the next character to the rolling hash. Check to see if this is a palindrome. If it is, go to step 2. If not, remove the first character from the rolling hash, thus moving it's center and keeping it the same length. Go to step 1.

This solution relies on the fact that we are only looking for the largest palindrome, so we can skip all palindromes smaller than the largest seen one.

This algorithm's weakness is similar to all hash-based algorithms' weaknesses, that their runtime cannot be guaranteed. In fact, it is trivial to think of an example where the runtime of this would be O(n^2): a string of all the same character. However, for random strings, the runtime averages out to O(n).

You can see an implementation of this algorithm in the repository [here](https://github.com/cakenggt/palindromic-rolling-string-hash).
