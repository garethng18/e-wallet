-keepattributes *Annotation*, InnerClasses
-dontwarn kotlinx.serialization.**
-keep,includedescriptorclasses class com.ewallet.app.**$$serializer { *; }
-keepclassmembers class com.ewallet.app.** {
    *** Companion;
}
