# Fix for Ruby 2.6 compatibility with Rails 6.1
# Rails 6.1 expects Logger to be available, but in Ruby 2.6 it needs to be required explicitly
require 'logger'

